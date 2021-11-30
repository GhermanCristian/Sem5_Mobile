package com.ubb.formula1predictor.prediction.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "predictions")
data class Prediction(
    @PrimaryKey @ColumnInfo(name = "_id") val _id: String,
    @ColumnInfo(name = "text") var text: String
) {
    override fun toString(): String = text
}
