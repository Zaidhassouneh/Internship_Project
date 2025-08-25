using System;

namespace API.Entites;

public class LandOfferPhoto
{
 public int Id { get; set; } // Primary key
    public required string Url { get; set; } // Path or URL to the photo
    public bool IsMain { get; set; } = false; // main/cover photo

    // Foreign key
    public int LandOfferId { get; set; }
    public LandOffer LandOffer { get; set; } = default!;
}
