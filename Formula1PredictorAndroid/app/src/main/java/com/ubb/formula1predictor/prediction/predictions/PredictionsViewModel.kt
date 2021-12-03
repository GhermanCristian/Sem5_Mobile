package com.ubb.formula1predictor.prediction.predictions

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

class PredictionListViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val predictions: LiveData<List<Prediction>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    val predictionRepository: PredictionRepository

    init {
        val predictionDao = PredictionDatabase.getDatabase(application, viewModelScope).predictionDao()
        predictionRepository = PredictionRepository(predictionDao)
        predictions = predictionRepository.predictions
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...")
            mutableLoading.value = true
            mutableException.value = null
            when (val result = predictionRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded")
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception)
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}