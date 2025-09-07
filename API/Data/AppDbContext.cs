using API.Entites;
using Microsoft.EntityFrameworkCore;
    
namespace API.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<AppUser> Users { get; set; }
    public DbSet<LandOffer> LandOffers { get; set; }
    public DbSet<LandOfferPhoto> LandOfferPhotos { get; set; }
    public DbSet<FarmerOffer> FarmerOffers { get; set; }
    public DbSet<FarmerOfferPhoto> FarmerOfferPhotos { get; set; }

}