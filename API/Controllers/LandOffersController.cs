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
public class LandOffersController(AppDbContext db, IFileStorage storage) : ControllerBase
{
    // GET: api/landoffers?available=true&page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LandOfferDto>>> GetOffers(
        [FromQuery] bool? available, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = db.LandOffers
            .AsNoTracking()
            .Include(o => o.Photos)
            .Include(o => o.Owner)
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        if (available.HasValue) q = q.Where(o => o.IsAvailable == available.Value);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    // GET: api/landoffers/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<LandOfferDto>> GetOffer(int id)
    {
        var offer = await db.LandOffers.Include(o => o.Photos).Include(o => o.Owner).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        return MapToDto(offer);
    }

    // POST: api/landoffers
    [HttpPost]
    public async Task<ActionResult<LandOfferDto>> Create([FromBody] LandOfferCreateDto dto)
    {
        var offer = new LandOffer
        {
            OwnerId = dto.OwnerId,
            Title = dto.Title,
            Description = dto.Description,
            Location = dto.Location,
            Price = dto.Price,
            IsForRent = dto.IsForRent,
            LandSize = dto.LandSize,
            LeaseDuration = dto.LeaseDuration,
            ContactNumber = dto.ContactNumber,
            CreatedAt = DateTime.UtcNow,
            IsAvailable = true
        };

        db.LandOffers.Add(offer);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, MapToDto(offer));
    }

    // PUT: api/landoffers/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<LandOfferDto>> Update(int id, [FromBody] LandOfferUpdateDto dto)
    {
        var offer = await db.LandOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        if (dto.Title != null) offer.Title = dto.Title;
        if (dto.Description != null) offer.Description = dto.Description;
        if (dto.Location != null) offer.Location = dto.Location;
        if (dto.Price.HasValue) offer.Price = dto.Price.Value;
        if (dto.IsForRent.HasValue) offer.IsForRent = dto.IsForRent.Value;
        if (dto.LandSize.HasValue) offer.LandSize = dto.LandSize.Value;
        if (dto.LeaseDuration.HasValue) offer.LeaseDuration = dto.LeaseDuration.Value;
        if (dto.ContactNumber != null) offer.ContactNumber = dto.ContactNumber;
        if (dto.IsAvailable.HasValue) offer.IsAvailable = dto.IsAvailable.Value;
        offer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(offer);
    }

    // DELETE: api/landoffers/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var offer = await db.LandOffers.FindAsync(id);
        if (offer == null) return NotFound();

        db.LandOffers.Remove(offer);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/landoffers/5/photos (multipart/form-data with "file")
    [HttpPost("{id:int}/photos")]
    public async Task<ActionResult<PhotoDto>> UploadPhoto(int id, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest("No file uploaded.");
        var offer = await db.LandOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        var url = await storage.SaveAsync(file);
        var isFirst = !offer.Photos.Any();

        var photo = new LandOfferPhoto { Url = url, IsMain = isFirst, LandOfferId = offer.Id };
        offer.Photos.Add(photo);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, new PhotoDto
        {
            Id = photo.Id, Url = photo.Url, IsMain = photo.IsMain
        });
    }

    // PUT: api/landoffers/5/photos/12/main
    [HttpPut("{offerId:int}/photos/{photoId:int}/main")]
    public async Task<ActionResult<LandOfferDto>> SetMainPhoto(int offerId, int photoId)
    {
        var offer = await db.LandOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == offerId);
        if (offer == null) return NotFound();

        var target = offer.Photos.FirstOrDefault(p => p.Id == photoId);
        if (target == null) return NotFound("Photo not found.");

        foreach (var p in offer.Photos) p.IsMain = false;
        target.IsMain = true;

        await db.SaveChangesAsync();
        return MapToDto(offer);
    }

    // DELETE: api/landoffers/5/photos/12
    [HttpDelete("{offerId:int}/photos/{photoId:int}")]
    public async Task<IActionResult> DeletePhoto(int offerId, int photoId)
    {
        var photo = await db.LandOfferPhotos.FirstOrDefaultAsync(p => p.Id == photoId && p.LandOfferId == offerId);
        if (photo == null) return NotFound();

        db.LandOfferPhotos.Remove(photo);
        await db.SaveChangesAsync();

        await storage.DeleteAsync(photo.Url);
        return NoContent();
    }

    private static LandOfferDto MapToDto(LandOffer o) => new()
    {
        Id = o.Id,
        OwnerId = o.OwnerId,
        OwnerName = o.Owner?.DisplayName ?? "Unknown",
        OwnerProfileImageUrl = o.Owner?.ProfileImageUrl,
        OwnerMemberSince = o.Owner?.CreatedAt ?? DateTime.MinValue,
        Title = o.Title,
        Description = o.Description,
        Location = o.Location,
        Price = o.Price,
        IsForRent = o.IsForRent,
        LandSize = o.LandSize,
        LeaseDuration = o.LeaseDuration,
        ContactNumber = o.ContactNumber,
        IsAvailable = o.IsAvailable,
        CreatedAt = o.CreatedAt,
        Photos = o.Photos
            .OrderByDescending(p => p.IsMain)
            .ThenBy(p => p.Id)
            .Select(p => new PhotoDto { Id = p.Id, Url = p.Url, IsMain = p.IsMain })
            .ToList()
    };
}
