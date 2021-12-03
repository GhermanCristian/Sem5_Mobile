package com.ubb.formula1predictor.prediction.data

import androidx.lifecycle.LiveData
import com.ubb.formula1predictor.core.Result
import com.ubb.formula1predictor.prediction.data.local.PredictionDao
import com.ubb.formula1predictor.prediction.data.remote.PredictionApi

class PredictionRepository(private val predictionDao: PredictionDao) {

    val predictions = predictionDao.getAll()

    suspend fun refresh(): Result<Boolean> {
        try {
            val predictions = PredictionApi.service.find()
            for (prediction in predictions) {
                predictionDao.insert(prediction)
            }
            return Result.Success(true)
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }

    fun getById(predictionId: String): LiveData<Prediction> {
        return predictionDao.getById(predictionId)
    }

    suspend fun save(): Result<Prediction> {
        try {
            val createdPrediction = PredictionApi.service.create()
            predictionDao.insert(createdPrediction)
            return Result.Success(createdPrediction)
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }

    suspend fun update(prediction: Prediction): Result<Prediction> {
        try {
            val updatedPrediction = PredictionApi.service.update(prediction._id, prediction)
            predictionDao.update(updatedPrediction)
            return Result.Success(updatedPrediction)
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }
}