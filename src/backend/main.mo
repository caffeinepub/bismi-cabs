import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextId = 0;

  type BookingLead = {
    leadId : Nat;
    customerName : Text;
    customerPhone : Text;
    pickupLocation : Text;
    dropLocation : Text;
    pickupDateTime : Text;
    notes : ?Text;
    createdAt : Time.Time;
    createdBy : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  let leads = Map.empty<Nat, BookingLead>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create a new booking lead
  public shared ({ caller }) func createBookingLead(customerName : Text, customerPhone : Text, pickupLocation : Text, dropLocation : Text, pickupDateTime : Text, notes : ?Text) : async BookingLead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create booking leads");
    };

    let leadId = nextId;
    nextId += 1;

    let newLead : BookingLead = {
      leadId;
      customerName;
      customerPhone;
      pickupLocation;
      dropLocation;
      pickupDateTime;
      notes;
      createdAt = Time.now();
      createdBy = caller;
    };

    leads.add(leadId, newLead);
    newLead;
  };

  // Get all booking leads
  public query ({ caller }) func getBookingLeads() : async [BookingLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    leads.values().toArray();
  };
};
