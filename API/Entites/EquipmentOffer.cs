using System;

namespace API.Entites;

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

    // Status and metadata
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Photos
    public ICollection<EquipmentOfferPhoto> Photos { get; set; } = new List<EquipmentOfferPhoto>();
}
