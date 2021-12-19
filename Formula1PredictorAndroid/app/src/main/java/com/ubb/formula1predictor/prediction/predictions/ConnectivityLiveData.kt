package com.ubb.formula1predictor.prediction.predictions

import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkInfo
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData

class ConnectivityLiveData internal constructor(private val connectivityManager: ConnectivityManager)
    : LiveData<Boolean>() {

    private val networkCallback = @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            postValue(true)
        }
        override fun onLost(network: Network) {
            postValue(false)
        }
    }

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onActive() {
        super.onActive()
        val activeNetwork: NetworkInfo? = connectivityManager.activeNetworkInfo
        postValue(activeNetwork?.isConnectedOrConnecting == true)
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    override fun onInactive() {
        super.onInactive()
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }
}