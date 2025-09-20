using System;
using API.Data;
using API.DTO;
using API.Entites;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FarmerOffersController(AppDbContext db, IFileStorage storage) : ControllerBase
{
    // GET: api/farmeroffers?available=true&page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FarmerOfferDto>>> GetOffers(
        [FromQuery] bool? available, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = db.FarmerOffers
            .AsNoTracking()
            .Include(o => o.Photos)
            .Include(o => o.Owner)
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        if (available.HasValue) q = q.Where(o => o.IsAvailable == available.Value);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        // Debug: Log all employment types
        foreach (var item in items)
        {
            Console.WriteLine($"DEBUG: FarmerOffer ID {item.Id}, EmploymentType: {item.EmploymentType} (Type: {item.EmploymentType.GetType()})");
        }

        return items.Select(MapToDto).ToList();
    }

    // GET: api/farmeroffers/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<FarmerOfferDto>> GetOffer(int id)
    {
        var offer = await db.FarmerOffers.Include(o => o.Photos).Include(o => o.Owner).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        return MapToDto(offer);
    }

    // POST: api/farmeroffers
    [HttpPost]
    public async Task<ActionResult<FarmerOfferDto>> Create([FromBody] FarmerOfferCreateDto dto)
    {
        Console.WriteLine($"DEBUG: Received EmploymentType: {dto.EmploymentType} (Type: {dto.EmploymentType.GetType()})");
        
        // Check if the owner exists, if not create a test user
        var owner = await db.Users.FirstOrDefaultAsync(u => u.Id == dto.OwnerId);
        if (owner == null)
        {
            // Create a test user for testing purposes
            owner = new AppUser
            {
                Id = dto.OwnerId,
                DisplayName = "Test User",
                Email = "test@example.com",
                PasswordHash = new byte[32], // Empty hash for test user
                PasswordSalt = new byte[32]  // Empty salt for test user
            };
            db.Users.Add(owner);
            await db.SaveChangesAsync();
        }

        var offer = new FarmerOffer
        {
            OwnerId = dto.OwnerId,
            FullName = dto.FullName,
            ContactNumber = dto.ContactNumber,
            CurrentAddress = dto.CurrentAddress,
            Description = dto.Description,
            EmploymentType = dto.EmploymentType,
            Age = dto.Age,
            CreatedAt = DateTime.UtcNow,
            IsAvailable = true
        };

        Console.WriteLine($"DEBUG: Storing EmploymentType: {offer.EmploymentType} (Type: {offer.EmploymentType.GetType()})");

        db.FarmerOffers.Add(offer);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, MapToDto(offer));
    }

    // PUT: api/farmeroffers/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<FarmerOfferDto>> Update(int id, [FromBody] FarmerOfferUpdateDto dto)
    {
        var offer = await db.FarmerOffers.FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        if (dto.FullName != null) offer.FullName = dto.FullName;
        if (dto.ContactNumber != null) offer.ContactNumber = dto.ContactNumber;
        if (dto.CurrentAddress != null) offer.CurrentAddress = dto.CurrentAddress;
        if (dto.Description != null) offer.Description = dto.Description;
        if (dto.EmploymentType.HasValue) offer.EmploymentType = dto.EmploymentType.Value;
        if (dto.Age.HasValue) offer.Age = dto.Age.Value;
        if (dto.IsAvailable.HasValue) offer.IsAvailable = dto.IsAvailable.Value;
        offer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(offer);
    }

    // DELETE: api/farmeroffers/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var offer = await db.FarmerOffers.FindAsync(id);
        if (offer == null) return NotFound();

        db.FarmerOffers.Remove(offer);
        await db.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/farmeroffers/5/photos (multipart/form-data with "file")
    [HttpPost("{id:int}/photos")]
    public async Task<ActionResult<FarmerOfferPhotoDto>> UploadPhoto(int id, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest("No file uploaded.");
        var offer = await db.FarmerOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        var url = await storage.SaveAsync(file);
        var isFirst = !offer.Photos.Any();

        var photo = new FarmerOfferPhoto { Url = url, IsMain = isFirst, FarmerOfferId = offer.Id };
        offer.Photos.Add(photo);
        offer.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, new FarmerOfferPhotoDto
        {
            Id = photo.Id, Url = photo.Url, IsMain = photo.IsMain
        });
    }

    // PUT: api/farmeroffers/5/photos/12/main
    [HttpPut("{offerId:int}/photos/{photoId:int}/main")]
    public async Task<ActionResult<FarmerOfferDto>> SetMainPhoto(int offerId, int photoId)
    {
        var offer = await db.FarmerOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == offerId);
        if (offer == null) return NotFound();

        var target = offer.Photos.FirstOrDefault(p => p.Id == photoId);
        if (target == null) return NotFound("Photo not found.");

        foreach (var p in offer.Photos) p.IsMain = false;
        target.IsMain = true;
        offer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(offer);
    }

    // DELETE: api/farmeroffers/5/photos/12
    [HttpDelete("{offerId:int}/photos/{photoId:int}")]
    public async Task<IActionResult> DeletePhoto(int offerId, int photoId)
    {
        var photo = await db.FarmerOfferPhotos.FirstOrDefaultAsync(p => p.Id == photoId && p.FarmerOfferId == offerId);
        if (photo == null) return NotFound();

        db.FarmerOfferPhotos.Remove(photo);
        await db.SaveChangesAsync();

        await storage.DeleteAsync(photo.Url);
        return NoContent();
    }

    // DEBUG: GET: api/farmeroffers/debug
    [HttpGet("debug")]
    public async Task<ActionResult> DebugData()
    {
        var offers = await db.FarmerOffers.ToListAsync();
        var debugInfo = offers.Select(o => new {
            Id = o.Id,
            FullName = o.FullName,
            EmploymentType = o.EmploymentType,
            EmploymentTypeValue = (int)o.EmploymentType,
            EmploymentTypeString = o.EmploymentType.ToString()
        }).ToList();

        return Ok(debugInfo);
    }

    // FIX: POST: api/farmeroffers/fix-employment-types
    [HttpPost("fix-employment-types")]
    public async Task<ActionResult> FixEmploymentTypes()
    {
        var offers = await db.FarmerOffers.ToListAsync();
        int fixedCount = 0;
        
        foreach (var offer in offers)
        {
            // Check if employment type is invalid (not 0 or 1)
            if ((int)offer.EmploymentType != 0 && (int)offer.EmploymentType != 1)
            {
                Console.WriteLine($"FIXING: Offer {offer.Id} has invalid employment type {offer.EmploymentType}, setting to PartTime");
                // Set to PartTime as default
                offer.EmploymentType = EmploymentType.PartTime;
                fixedCount++;
            }
        }
        
        if (fixedCount > 0)
        {
            await db.SaveChangesAsync();
            return Ok($"Fixed {fixedCount} employment type values");
        }
        
        return Ok("No employment types needed fixing");
    }

    private static FarmerOfferDto MapToDto(FarmerOffer o) 
    {
        Console.WriteLine($"DEBUG: Mapping FarmerOffer ID {o.Id}, EmploymentType: {o.EmploymentType} (Type: {o.EmploymentType.GetType()})");
        
        // Ensure the employment type is valid
        var employmentType = o.EmploymentType;
        if ((int)employmentType != 0 && (int)employmentType != 1)
        {
            Console.WriteLine($"WARNING: Invalid employment type {employmentType} for offer {o.Id}, setting to PartTime");
            employmentType = EmploymentType.PartTime;
        }
        
        return new FarmerOfferDto
        {
            Id = o.Id,
            OwnerId = o.OwnerId,
            OwnerName = o.Owner?.DisplayName ?? "Unknown",
            OwnerProfileImageUrl = o.Owner?.ProfileImageUrl,
            OwnerMemberSince = o.Owner?.CreatedAt ?? DateTime.MinValue,
            FullName = o.FullName,
            ContactNumber = o.ContactNumber,
            CurrentAddress = o.CurrentAddress,
            Description = o.Description,
            EmploymentType = employmentType,
            Age = o.Age,
            IsAvailable = o.IsAvailable,
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt,
            Photos = o.Photos
                .OrderByDescending(p => p.IsMain)
                .ThenBy(p => p.Id)
                .Select(p => new FarmerOfferPhotoDto { Id = p.Id, Url = p.Url, IsMain = p.IsMain })
                .ToList()
        };
    }
}

