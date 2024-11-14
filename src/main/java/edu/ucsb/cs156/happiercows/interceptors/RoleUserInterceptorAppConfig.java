package edu.ucsb.cs156.happiercows.interceptors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
public class RoleUserInterceptorAppConfig implements WebMvcConfigurer {
  @Autowired RoleUserInterceptor roleUserInterceptor;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(roleUserInterceptor);
  }
}
