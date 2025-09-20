using System;
using System.ComponentModel.DataAnnotations;
using API.Entites;

namespace API.DTO;

public class EquipmentOfferCreateDto
{
    [Required]
    public string OwnerId { get; set; } = string.Empty;
    
    [Required]
    [MinLength(3)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }
    
    [Required]
    public string Location { get; set; } = string.Empty;
    
    [Required]
    public string Condition { get; set; } = string.Empty;
    
    public DeliveryType DeliveryType { get; set; } = DeliveryType.SelfPickup;
    
    [Required]
    [Phone]
    public string ContactNumber { get; set; } = string.Empty;
}

public class EquipmentOfferUpdateDto
{
    [MinLength(3)]
    public string? Title { get; set; }
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal? Price { get; set; }
    
    public string? Location { get; set; }
    public string? Condition { get; set; }
    public DeliveryType? DeliveryType { get; set; }
    
    [Phone]
    public string? ContactNumber { get; set; }
    
    public bool? IsAvailable { get; set; }
}

public class EquipmentOfferPhotoDto
{
    public int Id { get; set; }
    public string Url { get; set; } = default!;
    public bool IsMain { get; set; }
}

public class EquipmentOfferDto
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = default!;
    public string OwnerName { get; set; } = default!;
    public string? OwnerProfileImageUrl { get; set; }
    public DateTime OwnerMemberSince { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Location { get; set; } = default!;
    public string Condition { get; set; } = default!;
    public DeliveryType DeliveryType { get; set; }
    public string? ContactNumber { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<EquipmentOfferPhotoDto> Photos { get; set; } = new();
}
