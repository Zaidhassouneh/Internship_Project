using System;

namespace API.Entites;

public enum EmploymentType
{
    PartTime = 0,    // "Part-Time"
    FullTime = 1     // "Full-Time"
}

public class FarmerOffer
{
    public int Id { get; set; } // Primary key

    // The farmer who created the offer
    public string OwnerId { get; set; } = default!;
    public AppUser Owner { get; set; } = default!;

    // Required fields
    public required string FullName { get; set; }
    public required string ContactNumber { get; set; }
    public required string CurrentAddress { get; set; }
    public required string Description { get; set; }
    public required EmploymentType EmploymentType { get; set; }

    // Optional fields
    public int? Age { get; set; }

    // Status and metadata
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Photos
    public ICollection<FarmerOfferPhoto> Photos { get; set; } = new List<FarmerOfferPhoto>();
}
