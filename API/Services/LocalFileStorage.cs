using System;

namespace API.Services;

// Services/LocalFileStorage.cs
using Microsoft.AspNetCore.Hosting;


public class LocalFileStorage(IWebHostEnvironment env) : IFileStorage
{
    private readonly string _basePath = Path.Combine(env.WebRootPath ?? "wwwroot", "images");

    public async Task<string> SaveAsync(IFormFile file, CancellationToken ct = default)
    {
        Directory.CreateDirectory(_basePath);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(_basePath, fileName);

        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        // Return a web-friendly relative path
        return $"/images/{fileName}";
    }

    public Task<bool> DeleteAsync(string relativePath)
    {
        // relativePath like "/images/abc.jpg"
        var sanitized = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine("wwwroot", sanitized.TrimStart(Path.DirectorySeparatorChar));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }
}

