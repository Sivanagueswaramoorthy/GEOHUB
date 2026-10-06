package com.club.geohub

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val appUrl = "https://appassets.androidplatform.net/assets/index.html"
    private val cameraPermissionCode = 1001

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request runtime Camera permission for Dynamic QR Scanner
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), cameraPermissionCode)
        }

        // Configure modern secure WebViewAssetLoader
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

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
                userAgentString = "GeoHubMobileApp/2.0 (Android; Mobile)"
            }

            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    // Grant Camera permission for web QR scanner
                    request?.grant(request.resources)
                }

                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    Log.d("GeoHubWeb", "${consoleMessage?.message()} -- [${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()}]")
                    return true
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val url = request?.url ?: return null

                    // 1. Intercept asset loader requests (/assets/...)
                    val assetResponse = assetLoader.shouldInterceptRequest(url)
                    if (assetResponse != null) return assetResponse

                    // 2. Intercept root-relative assets under appassets.androidplatform.net
                    if (url.host == "appassets.androidplatform.net") {
                        val path = url.path?.removePrefix("/") ?: ""
                        if (path.isNotEmpty()) {
                            val cleanPath = if (path.startsWith("assets/")) path.removePrefix("assets/") else path
                            try {
                                val stream = assets.open(cleanPath)
                                val mime = when {
                                    cleanPath.endsWith(".html") -> "text/html"
                                    cleanPath.endsWith(".css") -> "text/css"
                                    cleanPath.endsWith(".js") -> "application/javascript"
                                    cleanPath.endsWith(".png") -> "image/png"
                                    cleanPath.endsWith(".svg") -> "image/svg+xml"
                                    cleanPath.endsWith(".json") -> "application/json"
                                    cleanPath.endsWith(".ico") -> "image/x-icon"
                                    else -> "application/octet-stream"
                                }
                                return WebResourceResponse(mime, "UTF-8", stream)
                            } catch (e: Exception) {
                                Log.w("GeoHubWeb", "Asset fallback not found: $cleanPath")
                            }
                        }
                    }

                    return super.shouldInterceptRequest(view, request)
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    // Keep internal app navigation within WebView
                    if (url.startsWith("https://appassets.androidplatform.net")) {
                        return false
                    }
                    return false
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    Log.e("GeoHubWeb", "WebView error: ${error?.description} on ${request?.url}")
                }
            }
        }

        setContentView(webView)

        // Load self-contained local app bundle immediately
        webView.loadUrl(appUrl)

        // Handle hardware back button navigation
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
