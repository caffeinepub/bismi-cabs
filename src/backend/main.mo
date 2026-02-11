import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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

  type RateCard = {
    file : Storage.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Time.Time;
    originalFileName : Text;
    contentType : Text;
  };

  var latestRateCard : ?RateCard = null;

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

  public shared ({ caller }) func createBookingLead(
    customerName : Text,
    customerPhone : Text,
    pickupLocation : Text,
    dropLocation : Text,
    pickupDateTime : Text,
    notes : ?Text,
  ) : async BookingLead {
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

  public query ({ caller }) func getBookingLeads() : async [BookingLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    leads.values().toArray();
  };

  public shared ({ caller }) func uploadRateCard(
    file : Storage.ExternalBlob,
    originalFileName : Text,
    contentType : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can upload rate cards");
    };

    let newRateCard : RateCard = {
      file;
      uploadedBy = caller;
      uploadedAt = Time.now();
      originalFileName;
      contentType;
    };

    latestRateCard := ?newRateCard;
  };

  public query ({ caller }) func getLatestRateCard() : async ?RateCard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view rate cards");
    };
    latestRateCard;
  };
};
