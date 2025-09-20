using System;
using API.Entites;

namespace API.DTO;

public class FarmerOfferPhotoDto
{
    public int Id { get; set; }
    public string Url { get; set; } = default!;
    public bool IsMain { get; set; }
}

public class FarmerOfferCreateDto
{
    public string OwnerId { get; set; } = default!;
    
    // Required fields
    public string FullName { get; set; } = default!;
    public string ContactNumber { get; set; } = default!;
    public string CurrentAddress { get; set; } = default!;
    public string Description { get; set; } = default!;
    public EmploymentType EmploymentType { get; set; }
    
    // Optional fields
    public int? Age { get; set; }
}

public class FarmerOfferUpdateDto
{
    // Required fields
    public string? FullName { get; set; }
    public string? ContactNumber { get; set; }
    public string? CurrentAddress { get; set; }
    public string? Description { get; set; }
    public EmploymentType? EmploymentType { get; set; }
    
    // Optional fields
    public int? Age { get; set; }
    
    // Status
    public bool? IsAvailable { get; set; }
}

public class FarmerOfferDto
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = default!;
    public string OwnerName { get; set; } = default!;
    public string? OwnerProfileImageUrl { get; set; }
    public DateTime OwnerMemberSince { get; set; }
    
    // Required fields
    public string FullName { get; set; } = default!;
    public string ContactNumber { get; set; } = default!;
    public string CurrentAddress { get; set; } = default!;
    public string Description { get; set; } = default!;
    public EmploymentType EmploymentType { get; set; }
    
    // Optional fields
    public int? Age { get; set; }
    
    // Status and metadata
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Photos
    public List<FarmerOfferPhotoDto> Photos { get; set; } = new List<FarmerOfferPhotoDto>();
}
