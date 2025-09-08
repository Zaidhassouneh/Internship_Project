using System;

namespace API.Entites;

public class EquipmentOfferPhoto
{
    public int Id { get; set; } // Primary key
    public required string Url { get; set; } // Path or URL to the photo
    public bool IsMain { get; set; } = false; // main/cover photo

    // Foreign key
    public int EquipmentOfferId { get; set; }
    public EquipmentOffer EquipmentOffer { get; set; } = default!;
}
