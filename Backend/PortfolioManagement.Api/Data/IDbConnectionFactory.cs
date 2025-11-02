using System.Data;

namespace PortfolioManagement.Api.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

