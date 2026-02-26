package com.lebonexchange.api.mapper;

import com.lebonexchange.api.domain.bo.LoginCommandBo;
import com.lebonexchange.api.domain.bo.LoginResultBo;
import com.lebonexchange.api.domain.bo.RegisterCommandBo;
import com.lebonexchange.api.dto.request.LoginRequest;
import com.lebonexchange.api.dto.request.RegisterRequest;
import com.lebonexchange.api.dto.response.AuthUserResponse;
import com.lebonexchange.api.dto.response.LoginResponse;
import org.springframework.stereotype.Component;

@Component
public class AuthDtoMapper {

    public RegisterCommandBo toBo(RegisterRequest request) {
        return new RegisterCommandBo(request.email(), request.pseudonym(), request.password());
    }

    public LoginCommandBo toBo(LoginRequest request) {
        return new LoginCommandBo(request.email(), request.password());
    }

    public LoginResponse toResponse(LoginResultBo resultBo) {
        AuthUserResponse user = new AuthUserResponse(
                resultBo.user().id(),
                resultBo.user().email(),
                resultBo.user().pseudonym(),
                resultBo.user().avatar()
        );
        return LoginResponse.success(resultBo.token(), user);
    }
}
