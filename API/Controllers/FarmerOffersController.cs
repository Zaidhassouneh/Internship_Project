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
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        if (available.HasValue) q = q.Where(o => o.IsAvailable == available.Value);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    // GET: api/farmeroffers/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<FarmerOfferDto>> GetOffer(int id)
    {
        var offer = await db.FarmerOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        return MapToDto(offer);
    }

    // POST: api/farmeroffers
    [HttpPost]
    public async Task<ActionResult<FarmerOfferDto>> Create([FromBody] FarmerOfferCreateDto dto)
    {
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
            EmailAddress = dto.EmailAddress,
            CurrentAddress = dto.CurrentAddress,
            Description = dto.Description,
            Age = dto.Age,
            CreatedAt = DateTime.UtcNow,
            IsAvailable = true
        };

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
        if (dto.EmailAddress != null) offer.EmailAddress = dto.EmailAddress;
        if (dto.CurrentAddress != null) offer.CurrentAddress = dto.CurrentAddress;
        if (dto.Description != null) offer.Description = dto.Description;
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

    private static FarmerOfferDto MapToDto(FarmerOffer o) => new()
    {
        Id = o.Id,
        OwnerId = o.OwnerId,
        FullName = o.FullName,
        ContactNumber = o.ContactNumber,
        EmailAddress = o.EmailAddress,
        CurrentAddress = o.CurrentAddress,
        Description = o.Description,
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

