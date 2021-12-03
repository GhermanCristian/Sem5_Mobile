package com.ubb.formula1predictor.prediction.prediction

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ubb.formula1predictor.core.TAG
import com.ubb.formula1predictor.databinding.FragmentPredictionEditBinding
import com.ubb.formula1predictor.prediction.data.Prediction

class PredictionEditFragment : Fragment() {
    companion object {
        const val PREDICTION_ID = "PREDICTION_ID"
    }

    private lateinit var viewModel: PredictionEditViewModel
    private var predictionId: String? = null
    private var prediction: Prediction? = null

    private var _binding: FragmentPredictionEditBinding? = null

    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(PREDICTION_ID)) {
                predictionId = it.getString(PREDICTION_ID).toString()
            }
        }
        _binding = FragmentPredictionEditBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "save prediction")
            val i = prediction
            if (i != null) {
                i.name = binding.predictionName.text.toString()
                viewModel.saveOrUpdatePrediction(i)
            }
        }
        binding.predictionName.setText(predictionId)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(PredictionEditViewModel::class.java)
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigateUp()
            }
        })
        val id = predictionId
        if (id == null) {
            prediction = Prediction("", "", arrayListOf(""))
        } else {
            viewModel.getPredictionById(id).observe(viewLifecycleOwner, {
                Log.v(TAG, "update predictions")
                if (it != null) {
                    prediction = it
                    binding.predictionName.setText(it.name)
                }
            })
        }
    }
}