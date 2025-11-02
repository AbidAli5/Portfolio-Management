using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(Guid id);
    Task<List<User>> GetAllAsync(int page, int limit, string? search, string? role, bool? isActive);
    Task<int> GetTotalCountAsync(string? search, string? role, bool? isActive);
    Task<bool> ActivateAsync(Guid id, bool isActive);
}

