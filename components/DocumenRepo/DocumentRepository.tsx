'use client'

import {useState, useMemo} from 'react'
import {
  Search,
  FileText,
  File,
  FileImage,
  FileType,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCaseType } from '@/lib/case-tracker/formatters';
import { Card} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UploadAndClassifyController } from './UploadAndClassifyController';
import { Button } from '@/components/ui/button';
import { DeleteCaseFileDialog } from './DeleteCaseFileDialog';

interface DocumentRepositoryProps {
  documents: any[];
  caseId: string;
  caseFile: 'criminal' | 'civil';

}

const DocumentRepository = ({ documents, caseId, caseFile }: DocumentRepositoryProps) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (process.env.NODE_ENV === 'development'){
    console.log(documents, caseId)
  }

    const filteredDocuments = useMemo(() => {
      return documents.filter((doc) =>{
        const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
        const isFinalized = doc.status === "finalized";
        return matchesSearch && isFinalized;
     });
    }, [searchQuery, documents]);

  return (
    <Card className="shadow-sm overflow-hidden">
        {/* Card Header / Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <File size={20} />
              Documents Repository
            </div>
            <Badge variant="secondary">{filteredDocuments.length}</Badge>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-62.5">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                placeholder="Filter files..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

              <UploadAndClassifyController caseId={caseId} caseType={caseFile}/>

          </div>
        </div>

        {/* Table Content */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-180 text-xs font-semibold uppercase tracking-wider pl-6">
                Name
              </TableHead>
               <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Case Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Size
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Date Uploaded
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <TableRow
                key={doc.id}
                className="cursor-pointer hover:bg-muted/50 transition"
                onClick={() => setSelectedFileId(doc.id)}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* <FileIcon type={doc.fileType} /> */}
                      <div >
                        <p className="font-semibold text-sm">{doc.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCaseType(doc.caseType)}
                  </TableCell>
                  <TableCell className="text-center text-sm">{doc.size}</TableCell>
                  <TableCell className="text-center text-sm">{doc.date}</TableCell>
                  <TableCell
                  className="text-center text-sm pr-6"
                  onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            {/* <DownloadFile caseId={caseId} fileName={doc.name} /> */}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                          </DropdownMenuItem>

                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup asChild>
                            <DeleteCaseFileDialog caseId={caseId} fileName={doc.name} fileId={doc.id} />
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ):(
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 p-2">
                    <FileText className="h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No documents uploaded yet</p>
                    <p className="text-xs">Upload files to see them listed here.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}


          </TableBody>
        </Table>
      </Card>
  )
}

export default DocumentRepository