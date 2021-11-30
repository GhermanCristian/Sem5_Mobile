package com.ubb.formula1predictor.prediction.predictions

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ubb.formula1predictor.R
import com.ubb.formula1predictor.auth.data.AuthRepository
import com.ubb.formula1predictor.core.TAG
import com.ubb.formula1predictor.databinding.FragmentPredictionListBinding

class PredictionListFragment : Fragment() {
    private var _binding: FragmentPredictionListBinding? = null
    private lateinit var predictionListAdapter: PredictionListAdapter
    private lateinit var predictionsModel: PredictionListViewModel
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.i(TAG, "onCreateView")
        _binding = FragmentPredictionListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return;
        }
        setupPredictionList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "add new prediction")
            findNavController().navigate(R.id.PredictionEditFragment)
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
}