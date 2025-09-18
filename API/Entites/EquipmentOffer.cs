using System;

namespace API.Entites;

public enum DeliveryType
{
    SelfPickup = 0,           // "Self Pickup Only"
    DeliveryPaid = 1,         // "Delivery Available (Additional Fee)"
    FreeDelivery = 2,         // "Free Delivery Included"
    DeliveryOnly = 3          // "Delivery Only (No Pickup)"
}

public class EquipmentOffer
{
    public int Id { get; set; } // Primary key

    // The user who created the offer
    public string OwnerId { get; set; } = default!;
    public AppUser Owner { get; set; } = default!;

    // Offer details
    public required string Title { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public required string Location { get; set; }
    public required string Condition { get; set; } // "New" or "Used"
    public DeliveryType DeliveryType { get; set; } = DeliveryType.SelfPickup;
    public required string ContactNumber { get; set; } // Required contact number

    // Status and metadata
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Photos
    public ICollection<EquipmentOfferPhoto> Photos { get; set; } = new List<EquipmentOfferPhoto>();
}
