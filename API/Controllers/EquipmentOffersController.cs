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
public class EquipmentOffersController(AppDbContext db, IFileStorage storage) : ControllerBase
{
    // GET: api/equipmentoffers?available=true&page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EquipmentOfferDto>>> GetOffers(
        [FromQuery] bool? available, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = db.EquipmentOffers
            .AsNoTracking()
            .Include(o => o.Photos)
            .Include(o => o.Owner)
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        if (available.HasValue) q = q.Where(o => o.IsAvailable == available.Value);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    // GET: api/equipmentoffers/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipmentOfferDto>> GetOffer(int id)
    {
        var offer = await db.EquipmentOffers.Include(o => o.Photos).Include(o => o.Owner).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        return MapToDto(offer);
    }

    // POST: api/equipmentoffers
    [HttpPost]
    public async Task<ActionResult<EquipmentOfferDto>> Create([FromBody] EquipmentOfferCreateDto dto)
    {
        var offer = new EquipmentOffer
        {
            OwnerId = dto.OwnerId,
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            Location = dto.Location,
            Condition = dto.Condition,
            DeliveryType = dto.DeliveryType,
            ContactNumber = dto.ContactNumber,
            CreatedAt = DateTime.UtcNow,
            IsAvailable = true
        };

        db.EquipmentOffers.Add(offer);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, MapToDto(offer));
    }

    // PUT: api/equipmentoffers/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EquipmentOfferDto>> Update(int id, [FromBody] EquipmentOfferUpdateDto dto)
    {
        var offer = await db.EquipmentOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        if (dto.Title != null) offer.Title = dto.Title;
        if (dto.Description != null) offer.Description = dto.Description;
        if (dto.Price.HasValue) offer.Price = dto.Price.Value;
        if (dto.Location != null) offer.Location = dto.Location;
        if (dto.Condition != null) offer.Condition = dto.Condition;
        if (dto.DeliveryType.HasValue) offer.DeliveryType = dto.DeliveryType.Value;
        if (dto.ContactNumber != null) offer.ContactNumber = dto.ContactNumber;
        if (dto.IsAvailable.HasValue) offer.IsAvailable = dto.IsAvailable.Value;
        offer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(offer);
    }

    // DELETE: api/equipmentoffers/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var offer = await db.EquipmentOffers.FindAsync(id);
        if (offer == null) return NotFound();

        db.EquipmentOffers.Remove(offer);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/equipmentoffers/5/photos (multipart/form-data with "file")
    [HttpPost("{id:int}/photos")]
    public async Task<ActionResult<EquipmentOfferPhotoDto>> UploadPhoto(int id, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest("No file uploaded.");
        var offer = await db.EquipmentOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        var url = await storage.SaveAsync(file);
        var isFirst = !offer.Photos.Any();

        var photo = new EquipmentOfferPhoto { Url = url, IsMain = isFirst, EquipmentOfferId = offer.Id };
        offer.Photos.Add(photo);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, new EquipmentOfferPhotoDto
        {
            Id = photo.Id, Url = photo.Url, IsMain = photo.IsMain
        });
    }

    // PUT: api/equipmentoffers/5/photos/12/main
    [HttpPut("{offerId:int}/photos/{photoId:int}/main")]
    public async Task<ActionResult<EquipmentOfferDto>> SetMainPhoto(int offerId, int photoId)
    {
        var offer = await db.EquipmentOffers.Include(o => o.Photos).FirstOrDefaultAsync(o => o.Id == offerId);
        if (offer == null) return NotFound();

        var target = offer.Photos.FirstOrDefault(p => p.Id == photoId);
        if (target == null) return NotFound("Photo not found.");

        foreach (var p in offer.Photos) p.IsMain = false;
        target.IsMain = true;

        await db.SaveChangesAsync();
        return MapToDto(offer);
    }

    // DELETE: api/equipmentoffers/5/photos/12
    [HttpDelete("{offerId:int}/photos/{photoId:int}")]
    public async Task<IActionResult> DeletePhoto(int offerId, int photoId)
    {
        var photo = await db.EquipmentOfferPhotos.FirstOrDefaultAsync(p => p.Id == photoId && p.EquipmentOfferId == offerId);
        if (photo == null) return NotFound();

        db.EquipmentOfferPhotos.Remove(photo);
        await db.SaveChangesAsync();

        await storage.DeleteAsync(photo.Url);
        return NoContent();
    }

    private static EquipmentOfferDto MapToDto(EquipmentOffer o) => new()
    {
        Id = o.Id,
        OwnerId = o.OwnerId,
        OwnerName = o.Owner?.DisplayName ?? "Unknown",
        OwnerProfileImageUrl = o.Owner?.ProfileImageUrl,
        OwnerMemberSince = o.Owner?.CreatedAt ?? DateTime.MinValue,
        Title = o.Title,
        Description = o.Description,
        Price = o.Price,
        Location = o.Location,
        Condition = o.Condition,
        DeliveryType = o.DeliveryType,
        ContactNumber = o.ContactNumber,
        IsAvailable = o.IsAvailable,
        CreatedAt = o.CreatedAt,
        UpdatedAt = o.UpdatedAt,
        Photos = o.Photos
            .OrderByDescending(p => p.IsMain)
            .ThenBy(p => p.Id)
            .Select(p => new EquipmentOfferPhotoDto { Id = p.Id, Url = p.Url, IsMain = p.IsMain })
            .ToList()
    };
}
