package com.ubb.formula1predictor.prediction.predictions

import android.content.Context
import android.net.*
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.google.android.material.snackbar.Snackbar
import com.ubb.formula1predictor.R
import com.ubb.formula1predictor.auth.data.AuthRepository
import com.ubb.formula1predictor.core.TAG
import com.ubb.formula1predictor.databinding.FragmentPredictionListBinding

class PredictionListFragment : Fragment() {
    private var _binding: FragmentPredictionListBinding? = null
    private lateinit var predictionListAdapter: PredictionListAdapter
    private lateinit var predictionsModel: PredictionListViewModel
    private lateinit var connectivityManager: ConnectivityManager
    private lateinit var connectivityLiveData: ConnectivityLiveData
    private val binding get() = _binding!!

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        connectivityManager = activity?.getSystemService(android.net.ConnectivityManager::class.java)!!
        connectivityLiveData = ConnectivityLiveData(connectivityManager)
        connectivityLiveData.observe(this, {
            Log.d(TAG, "connectivityLiveData $it")
        })
    }

    override fun onStart() {
        super.onStart()
        Log.d(TAG, "isOnline ${isOnline()}")
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
    }

    override fun onStop() {
        super.onStop()
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        Log.i(TAG, "onCreateView")
        _binding = FragmentPredictionListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return
        }
        setupPredictionList()
        binding.fab.setOnClickListener {
            predictionsModel.addNewPrediction()
            Snackbar.make(view, "Added a new prediction", Snackbar.LENGTH_LONG)
                .setAction("Action", null).show()
            predictionsModel.refresh()
        }
    }

    private fun setupPredictionList() {
        predictionListAdapter = PredictionListAdapter(this)
        binding.predictionList.adapter = predictionListAdapter
        predictionsModel = ViewModelProvider(this).get(PredictionListViewModel::class.java)
        predictionsModel.predictions.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update predictions")
            predictionListAdapter.predictions = value
        })
        predictionsModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })
        predictionsModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })
        predictionsModel.refresh()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }

    private fun isOnline(): Boolean {
        val connMgr = activity?.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val networkInfo: NetworkInfo? = connMgr.activeNetworkInfo
        return networkInfo?.isConnected == true
    }

    private val networkCallback = @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            Log.d(TAG, "The default network is now: $network")
            predictionsModel.sendLocalChangesToServer()
        }

        override fun onLost(network: Network) {
            Log.d(TAG, "The application no longer has a default network. The last default network was $network")
        }

        override fun onCapabilitiesChanged(
            network: Network,
            networkCapabilities: NetworkCapabilities
        ) {
            Log.d(TAG, "The default network changed capabilities: $networkCapabilities")
        }

        override fun onLinkPropertiesChanged(network: Network, linkProperties: LinkProperties) {
            Log.d(TAG, "The default network changed link properties: $linkProperties")
        }
    }
}