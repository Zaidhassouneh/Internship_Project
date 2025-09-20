using System;

namespace API.DTO;

public class LandOfferCreateDto
{
    public required string OwnerId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Location { get; set; }
    public decimal Price { get; set; }
    public bool IsForRent { get; set; }
    public double? LandSize { get; set; }
    public int? LeaseDuration { get; set; }
    public required string ContactNumber { get; set; }
}

public class LandOfferUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public decimal? Price { get; set; }
    public bool? IsForRent { get; set; }
    public double? LandSize { get; set; }
    public int? LeaseDuration { get; set; }
    public string? ContactNumber { get; set; }
    public bool? IsAvailable { get; set; }
}

public class PhotoDto
{
    public int Id { get; set; }
    public string Url { get; set; } = default!;
    public bool IsMain { get; set; }
}

public class LandOfferDto
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = default!;
    public string OwnerName { get; set; } = default!;
    public string? OwnerProfileImageUrl { get; set; }
    public DateTime OwnerMemberSince { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string Location { get; set; } = default!;
    public decimal Price { get; set; }
    public bool IsForRent { get; set; }
    public double? LandSize { get; set; }
    public int? LeaseDuration { get; set; }
    public string ContactNumber { get; set; } = default!;
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PhotoDto> Photos { get; set; } = new();
}