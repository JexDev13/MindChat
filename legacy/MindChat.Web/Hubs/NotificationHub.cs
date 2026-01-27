using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MindChat.Web.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinUserGroup(string userId)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                _logger.LogInformation($"User {userId} joined notification group");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to add user {userId} to notification group");
            }
        }

        public async Task LeaveUserGroup(string userId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                _logger.LogInformation($"User {userId} left notification group");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to remove user {userId} from notification group");
            }
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                    _logger.LogInformation($"User {userId} connected to notification hub");
                }
                else
                {
                    _logger.LogWarning("User connected without valid user ID");
                }
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during notification hub connection");
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                    _logger.LogInformation($"User {userId} disconnected from notification hub");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during notification hub disconnection");
            }
            finally
            {
                await base.OnDisconnectedAsync(exception);
            }
        }
    }
}