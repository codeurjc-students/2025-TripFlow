package com.tripflow.security.jwt;

import java.io.IOException;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class UnauthorizedHandlerJwt implements AuthenticationEntryPoint {
	@Override
	public void commence(
		HttpServletRequest request, HttpServletResponse response,
		AuthenticationException authException
	) throws IOException {

		Map<String, Object> errorDetails = Map.of(
			"status", HttpServletResponse.SC_UNAUTHORIZED,
			"error", "Unauthorized",
			"message", authException.getMessage(),
			"path", request.getServletPath()
		);
		
		response.setContentType("application/json");
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.writeValue(response.getWriter(), errorDetails);
	}
}
