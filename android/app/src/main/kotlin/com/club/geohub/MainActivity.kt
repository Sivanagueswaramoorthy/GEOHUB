package com.club.geohub

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
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

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class AndroidNetworkBridge(private val context: Context, private val webView: WebView? = null) {

    @JavascriptInterface
    fun isConnected(): Boolean {
        return try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
            val network = cm.activeNetwork ?: return false
            val caps = cm.getNetworkCapabilities(network) ?: return false
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } catch (e: Exception) {
            Log.e("GeoHubNetwork", "Error checking connection: ${e.message}")
            false
        }
    }

    @JavascriptInterface
    fun isValidated(): Boolean {
        return try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
            val network = cm.activeNetwork ?: return false
            val caps = cm.getNetworkCapabilities(network) ?: return false
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        } catch (e: Exception) {
            Log.e("GeoHubNetwork", "Error validating network: ${e.message}")
            false
        }
    }

    @JavascriptInterface
    fun getNetworkType(): String {
        return try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return "NONE"
            val network = cm.activeNetwork ?: return "NONE"
            val caps = cm.getNetworkCapabilities(network) ?: return "NONE"
            when {
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WIFI"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "CELLULAR"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ETHERNET"
                else -> "OTHER"
            }
        } catch (e: Exception) {
            "NONE"
        }
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pInfo.versionName ?: "1.5.0"
        } catch (e: Exception) {
            "1.5.0"
        }
    }

    @JavascriptInterface
    fun getAppVersionCode(): Int {
        return try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                pInfo.versionCode
            }
        } catch (e: Exception) {
            7
        }
    }

    @JavascriptInterface
    fun downloadAndInstallApk(apkUrl: String) {
        thread(start = true) {
            val cdnFallbackUrl = "https://raw.githubusercontent.com/Sivanagueswaramoorthy/GEOHUB/main/geohub-app.apk"
            val initialUrl = if (apkUrl.startsWith("http://") || apkUrl.startsWith("https://")) {
                apkUrl
            } else {
                "https://raw.githubusercontent.com/Sivanagueswaramoorthy/GEOHUB/main" + if (apkUrl.startsWith("/")) apkUrl else "/$apkUrl"
            }

            var downloadSuccess = false
            val candidateUrls = if (initialUrl != cdnFallbackUrl) listOf(initialUrl, cdnFallbackUrl) else listOf(initialUrl)

            for (targetUrl in candidateUrls) {
                try {
                    Log.d("GeoHubOTA", "Attempting APK download from: $targetUrl")
                    postProgressToWeb(5, "Connecting to update server...")

                    val url = URL(targetUrl)
                    val connection = (url.openConnection() as HttpURLConnection).apply {
                        connectTimeout = 15000
                        readTimeout = 30000
                        requestMethod = "GET"
                        instanceFollowRedirects = true
                    }
                    connection.connect()

                    if (connection.responseCode !in 200..299) {
                        Log.w("GeoHubOTA", "HTTP error ${connection.responseCode} from $targetUrl, trying next source...")
                        connection.disconnect()
                        continue
                    }

                    val fileLength = connection.contentLength
                    val saveDir = File(context.cacheDir, "updates").apply { mkdirs() }
                    val apkFile = File(saveDir, "geohub-update.apk")
                    if (apkFile.exists()) {
                        apkFile.delete()
                    }

                    postProgressToWeb(15, "Downloading update package...")

                    var input: InputStream? = null
                    var output: FileOutputStream? = null
                    try {
                        input = connection.inputStream
                        output = FileOutputStream(apkFile)

                        val buffer = ByteArray(8192)
                        var total: Long = 0
                        var count: Int
                        var lastReported = 15

                        while (input.read(buffer).also { count = it } != -1) {
                            total += count
                            output.write(buffer, 0, count)
                            if (fileLength > 0) {
                                val percent = (15 + (total * 80 / fileLength)).toInt().coerceIn(15, 95)
                                if (percent >= lastReported + 5) {
                                    lastReported = percent
                                    postProgressToWeb(percent, "Downloading update: $percent%")
                                }
                            }
                        }
                        output.flush()
                    } finally {
                        output?.close()
                        input?.close()
                        connection.disconnect()
                    }

                    if (apkFile.length() < 100000) {
                        Log.w("GeoHubOTA", "Downloaded file too small (${apkFile.length()} bytes), trying fallback...")
                        apkFile.delete()
                        continue
                    }

                    postProgressToWeb(98, "Preparing package installer...")
                    Log.d("GeoHubOTA", "APK downloaded successfully to ${apkFile.absolutePath} (${apkFile.length()} bytes)")

                    // Launch package installer on UI thread
                    (context as? AppCompatActivity)?.runOnUiThread {
                        installApkFile(apkFile)
                    }
                    downloadSuccess = true
                    break
                } catch (e: Exception) {
                    Log.e("GeoHubOTA", "Failed download from $targetUrl: ${e.message}")
                }
            }

            if (!downloadSuccess) {
                postProgressToWeb(-1, "Update download failed across all servers. Please check your network connection.")
            }
        }
    }

    private fun postProgressToWeb(percent: Int, statusMsg: String) {
        webView?.post {
            val script = "window.__onApkDownloadProgress && window.__onApkDownloadProgress($percent, '${statusMsg.replace("'", "\\'")}');"
            webView.evaluateJavascript(script, null)
        }
    }

    private fun installApkFile(apkFile: File) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    postProgressToWeb(90, "Please enable Install Unknown Apps permission in Settings, then tap Install again.")
                    val manageIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${context.packageName}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(manageIntent)
                    return
                }
            }

            val apkUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(installIntent)
            postProgressToWeb(100, "Package installer opened.")
        } catch (e: Exception) {
            Log.e("GeoHubOTA", "Package installer launch failed: ${e.message}")
            postProgressToWeb(-1, "Installer error: ${e.localizedMessage}")
        }
    }
}

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

            // Inject native network verification & OTA installer bridge
            addJavascriptInterface(AndroidNetworkBridge(this@MainActivity, this), "AndroidBridge")

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
