package com.ubb.formula1predictor.prediction.data.local

import androidx.lifecycle.LiveData
import androidx.room.*
import com.ubb.formula1predictor.prediction.data.Prediction

@Dao
interface PredictionDao {
    @Query("SELECT * from predictions ORDER BY name ASC")
    fun getAll(): LiveData<List<Prediction>>

    @Query("SELECT * FROM predictions WHERE _id=:id")
    fun getById(id: String): LiveData<Prediction>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(prediction: Prediction)

    @Update(onConflict = OnConflictStrategy.REPLACE)
    suspend fun update(prediction: Prediction)

    @Query("DELETE FROM predictions")
    suspend fun deleteAll()
}