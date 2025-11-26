using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MindChat.Web.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(int chatId, string message, string sender)
        {
            await Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", chatId, message, sender);
        }

        public async Task JoinChat(int chatId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
        }

        public async Task LeaveChat(int chatId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
        }
    }
}
