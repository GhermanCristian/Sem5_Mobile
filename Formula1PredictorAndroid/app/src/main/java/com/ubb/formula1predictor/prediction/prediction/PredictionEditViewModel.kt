package com.ubb.formula1predictor.prediction.prediction

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.ubb.formula1predictor.core.Result
import com.ubb.formula1predictor.core.TAG
import com.ubb.formula1predictor.prediction.data.Prediction
import com.ubb.formula1predictor.prediction.data.PredictionRepository
import com.ubb.formula1predictor.prediction.data.local.PredictionDatabase
import kotlinx.coroutines.launch

class PredictionEditViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    val predictionRepository: PredictionRepository

    init {
        val predictionDao = PredictionDatabase.getDatabase(application, viewModelScope).predictionDao()
        predictionRepository = PredictionRepository(predictionDao)
    }

    fun getPredictionById(predictionId: String): LiveData<Prediction> {
        Log.v(TAG, "getPredictionById...")
        return predictionRepository.getById(predictionId)
    }

    fun saveOrUpdatePrediction(prediction: Prediction) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdatePrediction...")
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Prediction>
            if (prediction._id.isNotEmpty()) {
                result = predictionRepository.update(prediction)
            } else {
                result = predictionRepository.save()
            }
            when(result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdatePrediction succeeded")
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdatePrediction failed", result.exception)
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }
}