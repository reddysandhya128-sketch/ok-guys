// apps/web/components/chat-interface.tsx
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from 'lucide-react';

interface ChatResponse {
  sql: string;
  results: { columns: string[], data: (string | number)[][] };
}

export function ChatInterface() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse(null);

    try {
      // Step 1: Frontend sends query to backend endpoint /chat-with-data
      const res = await fetch('/api/chat-with-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) { throw new Error('Failed to get results from Vanna AI.'); }

      // Step 4: Frontend displays
      const data: ChatResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error(err);
      setResponse({ sql: 'ERROR', results: { columns: ['Status'], data: [[err.message || 'Unknown error occurred.']] } });
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <Card className="flex flex-col h-[650px]"> {/* Adjusted fixed height for layout */}
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">🤖 Chat with Data</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
        <ScrollArea className="flex-1 p-2 bg-white rounded-lg mb-4 mt-4 border">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-indigo-600">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Asking Vanna AI...
            </div>
          ) : response ? (
            <div className="space-y-3">
              <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200">
                <p className="text-xs font-semibold mb-1 text-indigo-700">Generated SQL:</p>
                <code className="text-xs block whitespace-pre-wrap font-mono">{response.sql}</code>
              </div>

              {/* Display Results Table */}
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      {response.results.columns.map((col, index) => (
                        <TableHead key={index}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {response.results.data.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="text-xs">{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-muted-foreground text-center p-4">
              Ask your data question in natural language (e.g., "List top 5 vendors by spend").
            </div>
          )}
        </ScrollArea>

        {/* Input Field */}
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Ask a data question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}