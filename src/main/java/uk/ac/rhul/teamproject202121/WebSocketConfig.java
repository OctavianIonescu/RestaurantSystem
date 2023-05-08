package uk.ac.rhul.teamproject202121;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configure the websockets for updating the tables and menu.
 * 
 * @author Team21
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


  /**
   * Configure the endpoints that clients can subscribe to.
   * 
   * @param config The config to setup
   */
  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/update", "/updatemenu");
  }


  /**
   * Configure the endpoints that we provide to be connected to by clients.
   * 
   * @param registry the registry of endpoints that can be connected to.
   */
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // requests made to the ws
    registry.addEndpoint("/stomp").withSockJS();
  }
}
