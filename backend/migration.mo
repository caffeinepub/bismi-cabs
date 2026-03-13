import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldBookingLead = {
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

  type OldRateCard = {
    file : Storage.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Time.Time;
    originalFileName : Text;
    contentType : Text;
  };

  type OldActor = {
    nextId : Nat;
    authorizedStaff : Map.Map<Principal, Bool>;
    bharzIznqv72xd7IigbgpPrincipal : Principal;
    leads : Map.Map<Nat, OldBookingLead>;
    isSiteDeleted : Bool;
    latestRateCard : ?OldRateCard;
  };

  type NewBookingLead = {
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

  type NewRateCard = {
    file : Storage.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Time.Time;
    originalFileName : Text;
    contentType : Text;
  };

  type NewActor = {
    nextId : Nat;
    authorizedStaff : Map.Map<Principal, Bool>;
    bharzIznqv72xd7IigbgpPrincipal : Principal;
    leads : Map.Map<Nat, NewBookingLead>;
    isSiteDeleted : Bool;
    latestRateCard : ?NewRateCard;
  };

  public func run(old : OldActor) : NewActor {
    let newLeads = old.leads.map<Nat, OldBookingLead, NewBookingLead>(
      func(_id, oldLead) {
        oldLead;
      }
    );
    { old with leads = newLeads };
  };
};
