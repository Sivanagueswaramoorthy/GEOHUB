package com.club.geohub

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val liveUrl = "https://roping-udder-unsaid.ngrok-free.dev"
    private val localAssetUrl = "file:///android_asset/index.html"
    private val cameraPermissionCode = 1001
    private val ngrokHeaders = mapOf("ngrok-skip-browser-warning" to "true")

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request runtime Camera permission if needed for QR Scanner
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), cameraPermissionCode)
        }

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                // Custom user-agent automatically removes ngrok warning page
                userAgentString = "GeoHubMobileApp/1.0"
            }

            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    // Grant Camera permission for web QR scanner
                    request?.grant(request.resources)
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    view?.loadUrl(url, ngrokHeaders)
                    return true
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    // Auto-click bypass in case ngrok page is ever shown
                    view?.evaluateJavascript(
                        """
                        (function() {
                            var btn = document.querySelector('button');
                            if (btn && (btn.innerText.indexOf('Visit') !== -1 || btn.textContent.indexOf('Visit') !== -1)) {
                                btn.click();
                            }
                        })();
                        """.trimIndent(),
                        null
                    )
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    // If live URL fails or device is offline, load bundled local assets
                    if (request?.isForMainFrame == true && view?.url != localAssetUrl) {
                        view?.loadUrl(localAssetUrl)
                    }
                }
            }
        }

        setContentView(webView)

        // Load live tunnel with ngrok-skip-browser-warning header
        webView.loadUrl(liveUrl, ngrokHeaders)

        // Handle back button navigation inside WebView
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }
}
