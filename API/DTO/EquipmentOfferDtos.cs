using System;

namespace API.DTO;

public class EquipmentOfferCreateDto
{
    public required string OwnerId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public required string Location { get; set; }
}

public class EquipmentOfferUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? Location { get; set; }
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
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Location { get; set; } = default!;
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<EquipmentOfferPhotoDto> Photos { get; set; } = new();
}
