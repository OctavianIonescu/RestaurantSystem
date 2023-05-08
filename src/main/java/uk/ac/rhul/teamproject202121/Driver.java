package uk.ac.rhul.teamproject202121;

import java.sql.SQLException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * A driver class to be used as the entry point into our application.
 * 
 * @author Team21
 *
 */

@ComponentScan(basePackages = "uk.ac.rhul.teamproject202121")
@SpringBootApplication
@EnableAutoConfiguration
public class Driver {



  /**
   * Launches the springboot webserver.
   * 
   * @param args command line arguments given to the program, for now they do nothing.
   * @throws SQLException thrown because of testing.
   */
  public static void main(String[] args) throws SQLException {

    SpringApplication.run(Driver.class, args);

  }

}
