using System;

namespace API.Entites;

public class FarmerOfferPhoto
{
    public int Id { get; set; } // Primary key
    public string Url { get; set; } = default!; // URL to the photo
    public bool IsMain { get; set; } = false; // Is this the main photo?
    public int FarmerOfferId { get; set; } // Foreign key to FarmerOffer
    public FarmerOffer FarmerOffer { get; set; } = default!; // Navigation property
}
