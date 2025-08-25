using System;

namespace API.Services;

public interface IFileStorage
{
    Task<string> SaveAsync(IFormFile file, CancellationToken ct = default);
    Task<bool> DeleteAsync(string relativePath);
}
