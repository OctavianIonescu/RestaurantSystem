package uk.ac.rhul.teamproject202121;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * A collection of broudcast endpoints for the different places that a user can subscribe to.
 * 
 * @author Team21
 */
@Controller
public class Update {

  @Autowired
  private SimpMessagingTemplate messageSender;

  /**
   * The endpoint for when the table status can change this happens when an order is placed, paid
   * for or updated by the kitchen.
   * 
   * @param message the message you would like to send to the frontend.
   */
  public void statusChange(String message) {
    this.messageSender.convertAndSend("/update", message);
  }

  /**
   * The endpoint for updating the menu when it is changed.
   * 
   * @param branchID the branch that has changed
   */
  public void menuChange(long branchID) {
    this.messageSender.convertAndSend("/updatemenu", Long.toString(branchID));
  }
}
