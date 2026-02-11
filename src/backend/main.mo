import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

import Blob "mo:core/Blob";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  var nextId = 0;
  let authorizedStaff = Map.empty<Principal, Bool>();

  let bharzIznqv72xd7IigbgpPrincipal = Principal.fromText("bharz-iznqv-72xd7-6tloz-pdzc2-6llb7-g5zjo-pnt5g-igbgp-qmeff-jqe");

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
    dp : ?Storage.ExternalBlob;
  };

  public shared ({ caller }) func uploadDp(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload display pictures");
    };
    let userProfile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          name = "NoName";
          dp = null;
        };
      };
      case (?profile) { profile };
    };
    let updatedProfile = { userProfile with dp = ?blob };
    userProfiles.add(caller, updatedProfile);
  };

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

  var leads = Map.empty<Nat, BookingLead>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  type RateCard = {
    file : Storage.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Time.Time;
    originalFileName : Text;
    contentType : Text;
  };

  var latestRateCard : ?RateCard = null;

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
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isAuthorizedStaffOrSpecialPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only owner or authorized staff can view all leads");
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

  public shared ({ caller }) func addAuthorizedStaff(staff : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add authorized staff");
    };
    authorizedStaff.add(staff, true);
  };

  public shared ({ caller }) func removeAuthorizedStaff(staff : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove authorized staff");
    };
    authorizedStaff.remove(staff);
  };

  public query ({ caller }) func getCurrentUserType() : async Text {
    if (isAdminOrAuthorizedStaff(caller)) {
      "authorizedStaff";
    } else {
      let role = AccessControl.getUserRole(accessControlState, caller);
      switch (role) {
        case (#admin) {
          Runtime.trap("Unexpected: Admin should also be marked as authorized staff");
        };
        case (#user) { "user" };
        case (#guest) { "guest" };
      };
    };
  };

  func isAuthorizedStaff(caller : Principal) : Bool {
    authorizedStaff.containsKey(caller);
  };

  func isAdminOrAuthorizedStaff(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isAuthorizedStaffOrSpecialPrincipal(caller);
  };

  func isAuthorizedStaffOrSpecialPrincipal(caller : Principal) : Bool {
    isAuthorizedStaff(caller) or caller.toText() == bharzIznqv72xd7IigbgpPrincipal.toText();
  };
};
