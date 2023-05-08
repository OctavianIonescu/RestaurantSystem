package uk.ac.rhul.teamproject202121;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Class for providing the routing needed by react router.
 * 
 * @author team21
 */
@Controller
public class ReactMapping {
  /**
   * Redirect react routes to the homepage.
   * 
   * @return the homepage
   */
  @RequestMapping(value = {"/{[path:[^\\.]*}", "/manager/{**}"})
  public String redirect() {
    return "forward:/index.html";
  }
}
