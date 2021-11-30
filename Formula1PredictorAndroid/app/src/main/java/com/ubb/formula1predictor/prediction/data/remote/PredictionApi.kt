package com.ubb.formula1predictor.prediction.data.remote

import com.ubb.formula1predictor.core.Api
import com.ubb.formula1predictor.prediction.data.Prediction
import retrofit2.http.*

object PredictionApi {
    interface Service {
        @GET("/api/predictions")
        suspend fun find(): List<Prediction>

        @GET("/api/prediction/{id}")
        suspend fun read(@Path("id") itemId: String): Prediction;

        @Headers("Content-Type: application/json")
        @POST("/api/prediction")
        suspend fun create(@Body item: Prediction): Prediction

        @Headers("Content-Type: application/json")
        @PUT("/api/prediction/{id}")
        suspend fun update(@Path("id") itemId: String, @Body item: Prediction): Prediction
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}