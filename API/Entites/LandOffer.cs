using System;

namespace API.Entites;

public class LandOffer
{
 public int Id { get; set; } // Primary key

    // The user who created the offer
    public string OwnerId { get; set; } = default!;
    public AppUser Owner { get; set; } = default!;

    // Offer details
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Location { get; set; }
    public decimal Price { get; set; }
    public bool IsForRent { get; set; }   // true = rent, false = buy
    public double? LandSize { get; set; } // optional (m², dunams, etc.)

    public int? LeaseDuration { get; set; }

    // Status
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Photos
    public ICollection<LandOfferPhoto> Photos { get; set; } = new List<LandOfferPhoto>();
}
