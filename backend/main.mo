import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

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

  type RateCard = {
    file : Storage.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Time.Time;
    originalFileName : Text;
    contentType : Text;
  };

  var nextId = 0;
  let authorizedStaff = Map.empty<Principal, Bool>();

  let bharzIznqv72xd7IigbgpPrincipal = Principal.fromText("bharz-iznqv-72xd7-6tloz-pdzc2-6llb7-g5zjo-pnt5g-igbgp-qmeff-jqe");
  var leads = Map.empty<Nat, BookingLead>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var latestRateCard : ?RateCard = null;

  var isSiteDeleted = false;

  public shared ({ caller }) func uploadDp(blob : Storage.ExternalBlob) : async () {
    requireSiteNotDeleted();
    requireUser(caller);
    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { { name = "NoName"; dp = null } };
      case (?profile) { profile };
    };
    let updatedProfile = { userProfile with dp = ?blob };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireSiteNotDeleted();
    requireUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireSiteNotDeleted();
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireSiteNotDeleted();
    requireUser(caller);
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
    requireSiteNotDeleted();
    requireUser(caller);

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
    requireSiteNotDeleted();
    if (not AccessControl.isAdmin(accessControlState, caller) and not isAuthorizedStaffOrSpecialPrincipal(caller)) {
      Runtime.trap("Unauthorized: Only owner or authorized staff can view all leads");
    };
    leads.values().toArray();
  };

  public shared ({ caller }) func uploadRateCard(
    file : Storage.ExternalBlob,
    originalFileName : Text,
    contentType : Text,
  ) : async () {
    requireSiteNotDeleted();
    requireAdmin(caller);

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
    requireSiteNotDeleted();
    requireUser(caller);
    latestRateCard;
  };

  public shared ({ caller }) func addAuthorizedStaff(staff : Principal) : async () {
    requireSiteNotDeleted();
    requireAdmin(caller);
    authorizedStaff.add(staff, true);
  };

  public shared ({ caller }) func removeAuthorizedStaff(staff : Principal) : async () {
    requireSiteNotDeleted();
    requireAdmin(caller);
    authorizedStaff.remove(staff);
  };

  public query ({ caller }) func getCurrentUserType() : async Text {
    requireSiteNotDeleted();
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

  public shared ({ caller }) func deleteSiteAndWipeData() : async () {
    requireAdmin(caller);
    if (isSiteDeleted) {
      Runtime.trap("Site has already been deleted");
    };
    isSiteDeleted := true;
    leads.clear();
    userProfiles.clear();
    latestRateCard := null;
    authorizedStaff.clear();
  };

  public query ({ caller }) func checkIfSiteIsDeleted() : async Bool {
    isSiteDeleted;
  };

  func requireSiteNotDeleted() {
    if (isSiteDeleted) {
      Runtime.trap("This site has been deleted and is no longer available.");
    };
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
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
