import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/authProvider';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { ListCollapse, SendHorizonal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); 
interface Message {
    authorId: string;
    author: string;
    text: string;
  }

export function Chat() {
  const [messages, setMessages] =useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const { name } = useAuth();
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [chatName, setChatName] = useState('');

  const toggleTeams = () => setIsTeamsOpen(prev => !prev);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conectado ao WebSocket');
    });
    console.log(name);
    socket.emit('set_username', name); 

    socket.on('received_message', (data) => {
      setMessages((prevMessages) => {
        return [...prevMessages, data];
      });
    });

    return () => {
        socket.disconnect();
        };
    }, [name]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

     const sendMessage = () => {
        if (message) {
        socket.emit('message', message);
        setMessage('');
        }
    };

    const getInitials = (name: string) => {
        if (!name || typeof name !== 'string') {
            return '';
        }
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    function setNameChat(name: string) {
        setChatName(name);
        console.log(chatName);
    }
    

return (
    <div>
        <div className='flex items-start'>
            <ListCollapse size={32} className="block md:hidden text-white p-2 rounded" onClick={toggleTeams} />
            <p className='text-white font-medium text-2xl'>Equipes</p>
        </div>

        <div className='flex flex-row'>
            <div className={`flex flex-col ${isTeamsOpen ? 'block' : 'hidden'} md:block hidden-mobile`}>
                <div className="flex flex-row mt-5 cursor-pointer shadow-shape bg-zinc-700 rounded-2xl w-auto min-w-96 items-center hover:bg-indigo-500" onClick={() => setNameChat('Equipe Desenvolvimento')}>
                    <div className='flex flex-col items-center '>
                    <Avatar className="w-20 h-20 flex items-center justify-center">
                        <AvatarFallback className="bg-zinc-300 text-zinc-950 text-md p-3 rounded-3xl">
                            {getInitials('Equipe Desenvolvimento')}
                        </AvatarFallback>
                    </Avatar>
                    </div>
                    <div className='flex flex-col'>
                    <p className="text-white text-center flex items-center justify-center text-sm font-semibold">Equipe Desenvolvimento</p>
                    </div>
                </div>
                <div className="flex flex-row mt-5 cursor-pointer shadow-shape bg-zinc-700 rounded-2xl w-auto min-w-96 items-center hover:bg-indigo-500" onClick={() => setNameChat('Equipe Suporte')}>
                    <div className='flex flex-col items-center '>
                    <Avatar className="w-20 h-20 flex items-center justify-center rounded-3xl">
                        <AvatarFallback className="bg-zinc-300 text-zinc-950 text-md p-3 rounded-3xl">
                            {getInitials('Equipe Suporte')}
                        </AvatarFallback>
                    </Avatar>
                    </div>
                    <div className='flex flex-col'>
                        <p className="text-white text-center flex items-center justify-center text-sm font-semibold">Equipe Suporte Técnico</p>
                    </div>
                </div>
            </div>

            {/* Área de chat */}
            <div className={`flex flex-col w-full md:ml-10 ${!isTeamsOpen ? 'block' : 'hidden'}`}>
                <div className='shadow-shape bg-zinc-800 mt-5 rounded-2xl flex-1 flex flex-col max-h-[700px] md:min-h-[600px] '>
                    {/* Conteúdo do chat */}
                    <div className="flex flex-row mb-5 cursor-pointer shadow-shape rounded-2xl w-auto min-w-96 items-center h-16">
                    <div className='flex flex-col items-center'>
                        <Avatar className="w-20 max-20 flex items-center justify-center rounded-3xl">
                        <AvatarFallback className="bg-zinc-300 text-zinc-950 text-md p-3 rounded-3xl">
                            {getInitials(chatName)}
                        </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-white font-bold text-xl'>{chatName}</p>
                    </div>
                    </div>

                    <div className='flex flex-col flex-1 overflow-auto'>
                    {messages.map((message, index) => (
                        <div
                        className={`message-container ${
                            message.authorId === socket.id ? 'justify-end' : 'justify-start'
                        } flex mb-2 items-center`}
                        key={index}
                        >
                        {message.authorId !== socket.id && (
                            <Avatar className="w-20 h-20 flex items-center justify-center mr-2 rounded-3xl">
                            <AvatarFallback className="bg-zinc-300 text-zinc-950 text-sm p-3 rounded-3xl">
                                {getInitials(message.author)}
                            </AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`message ${message.authorId === socket.id ? 'bg-indigo-700 text-white' : 'bg-zinc-400 text-black'} p-2 rounded-lg max-w-xs `}>
                            <div className="message-author font-bold max-w-xs">{message.author}</div>
                            <div className="message-text max-w-lg">{message.text}</div>
                        </div>
                        {message.authorId === socket.id && (
                            <Avatar className="w-20 h-20 flex items-center justify-center ml-2 rounded-3xl">
                            <AvatarFallback className="bg-indigo-300 text-zinc-950 text-sm p-3 rounded-3xl">
                                {getInitials(message.author)}
                            </AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                    </div>

                    <div className="relative flex items-center bg-zinc-900 border-zinc-800 rounded-xl w-full mt-5">
                        <Input 
                            type='text'
                            placeholder='Digite uma mensagem...'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendMessage();
                                e.preventDefault(); 
                            }
                            }}
                            className="pl-5 pr-4 py-2 text-md rounded-2xl h-12 w-full max-w-4xl border bg-transparent border-none shadow-shape" 
                        />
                        <SendHorizonal onClick={sendMessage} size={24} className="absolute right-3 text-indigo-400 cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    </div>

  );
}
