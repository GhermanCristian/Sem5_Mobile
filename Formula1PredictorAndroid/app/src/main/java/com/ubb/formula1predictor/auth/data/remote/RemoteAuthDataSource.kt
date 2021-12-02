package com.ubb.formula1predictor.auth.data.remote

import com.ubb.formula1predictor.auth.data.TokenHolder
import com.ubb.formula1predictor.auth.data.User
import com.ubb.formula1predictor.core.Api
import com.ubb.formula1predictor.core.Result
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

object RemoteAuthDataSource {
    interface AuthService {
        @Headers("Content-Type: application/json")
        @POST("/api/auth/login")
        suspend fun login(@Body user: User): TokenHolder
    }

    private val authService: AuthService = Api.retrofit.create(AuthService::class.java)

    suspend fun login(user: User): Result<TokenHolder> {
        try {
            return Result.Success(authService.login(user))
        }
        catch (e: Exception) {
            return Result.Error(e)
        }
    }
}

