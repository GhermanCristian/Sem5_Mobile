package com.ubb.formula1predictor.prediction.data

import androidx.lifecycle.LiveData
import com.ubb.formula1predictor.core.Result
import com.ubb.formula1predictor.prediction.data.local.PredictionDao
import com.ubb.formula1predictor.prediction.data.remote.PredictionApi

class PredictionRepository(private val predictionDao: PredictionDao) {

    val predictions = predictionDao.getAll()

    suspend fun refresh(): Result<Boolean> {
        return try {
            val predictions = PredictionApi.service.find()
            for (prediction in predictions) {
                predictionDao.insert(prediction)
            }
            Result.Success(true)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    fun getById(predictionId: String): LiveData<Prediction> {
        return predictionDao.getById(predictionId)
    }

    suspend fun save(): Result<Prediction> {
        return try {
            val createdPrediction = PredictionApi.service.create()
            predictionDao.insert(createdPrediction)
            Result.Success(createdPrediction)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun update(prediction: Prediction): Result<Prediction> {
        return try {
            val updatedPrediction = PredictionApi.service.update(prediction._id, prediction)
            Result.Success(updatedPrediction)
        }
        catch (e: Exception) {
            try {
                predictionDao.update(prediction)
                Result.Success(prediction)
            }
            catch (e: Exception) {
                Result.Error(e)
            }
        }
    }

    suspend fun sendLocalChangesToServer() {
        predictions.value?.forEach {
            PredictionApi.service.update(it._id, it)
        }
    }
}