"""
Meeting Intelligence Service
Handles end-to-end meeting processing with contextual AI generation
"""

import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.core.recall_service import recall_service
from app.core.ai_service import generate_content, generate_email, generate_summary, generate_action_items
from app.core.vector_store import search_knowledge_base
from app.core.database import db_manager
from app.models.output import Output
from app.utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class MeetingIntelligenceService:
    """
    Complete meeting intelligence pipeline:
    1. Bot joins meeting automatically
    2. Captures transcript, video, audio
    3. Processes with AI using client context
    4. Generates action items, emails, summaries
    5. Stores everything in centralized brain
    """
    
    def __init__(self):
        self.active_meetings: Dict[str, Dict] = {}  # meeting_id -> meeting_data
        self.processing_queue: List[str] = []  # Queue of meetings to process
    
    async def start_meeting_recording(
        self,
        meeting_url: str,
        meeting_id: str,
        client_id: str,
        sub_client_id: Optional[str] = None,
        user_id: str = None,
        attendees: List[str] = None,
        meeting_title: str = "Meeting"
    ) -> Dict[str, Any]:
        """
        Start recording a meeting with bot
        
        Args:
            meeting_url: URL of the meeting to join
            meeting_id: Unique meeting identifier
            client_id: Client organization ID for context
            sub_client_id: Sub-client ID (optional)
            user_id: User who initiated the recording
            attendees: List of attendee emails
            meeting_title: Title of the meeting
            
        Returns:
            Dict with bot_id, status, and meeting info
        """
        try:
            logger.info(f"🎬 Starting meeting recording for: {meeting_title}")
            
            # Create bot with Recall AI
            bot_result = recall_service.create_bot(
                meeting_url=meeting_url,
                bot_name=f"Lemur AI - {meeting_title}"
            )
            
            if not bot_result["success"]:
                raise Exception(f"Failed to create bot: {bot_result.get('error')}")
            
            bot_id = bot_result["bot_id"]
            
            # Store meeting data for processing
            meeting_data = {
                "meeting_id": meeting_id,
                "bot_id": bot_id,
                "meeting_url": meeting_url,
                "client_id": client_id,
                "sub_client_id": sub_client_id,
                "user_id": user_id,
                "attendees": attendees or [],
                "meeting_title": meeting_title,
                "status": "recording",
                "started_at": datetime.now(),
                "processed": False
            }
            
            self.active_meetings[meeting_id] = meeting_data
            
            # Start monitoring in background
            asyncio.create_task(self._monitor_meeting_completion(meeting_id))
            
            logger.info(f"✅ Bot {bot_id} created and monitoring started for meeting {meeting_id}")
            
            return {
                "success": True,
                "bot_id": bot_id,
                "meeting_id": meeting_id,
                "status": "recording",
                "message": f"Bot is joining {meeting_title} and will start recording"
            }
            
        except Exception as e:
            logger.error(f"❌ Error starting meeting recording: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _monitor_meeting_completion(self, meeting_id: str):
        """Monitor meeting for completion and trigger processing"""
        try:
            meeting_data = self.active_meetings.get(meeting_id)
            if not meeting_data:
                return
            
            bot_id = meeting_data["bot_id"]
            logger.info(f"🔍 Monitoring meeting {meeting_id} with bot {bot_id}")
            
            # Poll for completion (check every 30 seconds)
            while True:
                await asyncio.sleep(30)
                
                # Check bot status
                status_result = recall_service.get_bot_status(bot_id)
                
                if status_result["success"]:
                    status = status_result["status"]
                    meeting_data["status"] = status
                    
                    logger.info(f"📊 Meeting {meeting_id} status: {status}")
                    
                    # Check if meeting is completed
                    if status in ["done", "completed", "finished"]:
                        logger.info(f"✅ Meeting {meeting_id} completed, starting AI processing")
                        
                        # Add to processing queue
                        self.processing_queue.append(meeting_id)
                        
                        # Start AI processing
                        asyncio.create_task(self._process_completed_meeting(meeting_id))
                        break
                        
                    elif status in ["failed", "error"]:
                        logger.error(f"❌ Meeting {meeting_id} recording failed")
                        meeting_data["status"] = "failed"
                        break
                
        except Exception as e:
            logger.error(f"❌ Error monitoring meeting {meeting_id}: {e}")
    
    async def _process_completed_meeting(self, meeting_id: str):
        """Process completed meeting with AI"""
        try:
            meeting_data = self.active_meetings.get(meeting_id)
            if not meeting_data:
                return
            
            bot_id = meeting_data["bot_id"]
            client_id = meeting_data["client_id"]
            sub_client_id = meeting_data.get("sub_client_id")
            user_id = meeting_data["user_id"]
            meeting_title = meeting_data["meeting_title"]
            
            logger.info(f"🧠 Processing completed meeting: {meeting_title}")
            
            # Get download URLs
            logger.info(f"📥 Getting download URLs for bot {bot_id}")
            download_result = recall_service.get_download_urls(bot_id)

            logger.info(f"📥 Download result: {download_result}")

            if not download_result["success"]:
                logger.error(f"❌ Failed to get download URLs for meeting {meeting_id}: {download_result}")
                return

            transcript_url = download_result.get("transcript_url")
            video_url = download_result.get("video_url")
            audio_url = download_result.get("audio_url")

            logger.info(f"📥 URLs - Video: {video_url}, Transcript: {transcript_url}")

            # Download and process transcript
            if transcript_url:
                logger.info(f"📥 Downloading transcript from: {transcript_url}")
                transcript_text = await self._download_transcript(transcript_url)

                if transcript_text:
                    logger.info(f"✅ Transcript downloaded successfully, length: {len(transcript_text)} characters")
                else:
                    logger.error(f"❌ Failed to download transcript from URL")
                    return
            else:
                logger.error(f"❌ No transcript URL available for meeting {meeting_id}")
                # Try to get transcript content directly from bot data
                bot_data = download_result.get("data", {})
                transcript_text = self._extract_transcript_from_bot_data(bot_data)

                if transcript_text:
                    logger.info(f"✅ Extracted transcript from bot data, length: {len(transcript_text)} characters")
                else:
                    logger.error(f"❌ No transcript available for meeting {meeting_id}")
                    return
            
            # Get client context from knowledge base
            client_context = await self._get_client_context(client_id, sub_client_id, meeting_title)
            
            # Generate AI content with context
            ai_results = await self._generate_meeting_ai_content(
                transcript_text=transcript_text,
                client_context=client_context,
                meeting_data=meeting_data
            )
            
            # Store everything in database
            await self._store_meeting_results(
                meeting_data=meeting_data,
                transcript_text=transcript_text,
                video_url=video_url,
                audio_url=audio_url,
                ai_results=ai_results
            )
            
            # Mark as processed
            meeting_data["processed"] = True
            meeting_data["processed_at"] = datetime.now()
            
            logger.info(f"✅ Meeting {meeting_id} fully processed and stored")
            
        except Exception as e:
            logger.error(f"❌ Error processing meeting {meeting_id}: {e}")
    
    async def _download_transcript(self, transcript_url: str) -> Optional[str]:
        """Download transcript from URL"""
        try:
            import aiohttp
            
            async with aiohttp.ClientSession() as session:
                async with session.get(transcript_url) as response:
                    if response.status == 200:
                        content = await response.text()
                        return content
                    else:
                        logger.error(f"Failed to download transcript: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error downloading transcript: {e}")
            return None

    def _extract_transcript_from_bot_data(self, bot_data: Dict) -> Optional[str]:
        """Extract transcript text directly from bot data"""
        try:
            # Try to find transcript in various locations in bot data
            recordings = bot_data.get('recordings', [])

            for recording in recordings:
                # Check if transcript is embedded in recording data
                transcript_data = recording.get('transcript')
                if transcript_data:
                    if isinstance(transcript_data, str):
                        return transcript_data
                    elif isinstance(transcript_data, dict):
                        # Look for text content in transcript object
                        text_content = transcript_data.get('text') or transcript_data.get('content')
                        if text_content:
                            return text_content

                # Check media shortcuts for transcript
                media_shortcuts = recording.get('media_shortcuts', {})
                if 'transcript' in media_shortcuts:
                    transcript_info = media_shortcuts['transcript']
                    if isinstance(transcript_info, dict):
                        data = transcript_info.get('data', {})
                        text_content = data.get('text') or data.get('content')
                        if text_content:
                            return text_content

            logger.warning("No transcript text found in bot data")
            return None

        except Exception as e:
            logger.error(f"Error extracting transcript from bot data: {e}")
            return None

    async def _get_client_context(
        self, 
        client_id: str, 
        sub_client_id: Optional[str], 
        meeting_title: str
    ) -> str:
        """Get relevant client context from knowledge base"""
        try:
            # Search for relevant documents in client's knowledge base
            search_query = f"meeting {meeting_title} project context background"
            
            search_results = search_knowledge_base(
                query=search_query,
                client_id=client_id,
                sub_client_id=sub_client_id,
                n_results=5
            )
            
            if search_results:
                context_parts = []
                for result in search_results:
                    context_parts.append(f"Document: {result.get('filename', 'Unknown')}")
                    context_parts.append(f"Content: {result.get('content', '')[:500]}...")
                    context_parts.append("---")
                
                return "\n".join(context_parts)
            else:
                return "No specific client context found in knowledge base."
                
        except Exception as e:
            logger.error(f"Error getting client context: {e}")
            return "Error retrieving client context."
    
    async def _generate_meeting_ai_content(
        self,
        transcript_text: str,
        client_context: str,
        meeting_data: Dict
    ) -> Dict[str, Any]:
        """Generate AI content for the meeting"""
        try:
            client_id = meeting_data["client_id"]
            sub_client_id = meeting_data.get("sub_client_id")
            meeting_title = meeting_data["meeting_title"]
            attendees = meeting_data.get("attendees", [])
            
            # Prepare context for AI
            full_context = f"""
            Meeting: {meeting_title}
            Attendees: {', '.join(attendees)}
            
            Client Context:
            {client_context}
            
            Meeting Transcript:
            {transcript_text}
            """
            
            # Generate different types of content
            results = {}
            
            # 1. Meeting Summary
            summary_result = await generate_summary(
                prompt=f"Create a comprehensive meeting summary based on this transcript and client context: {full_context}",
                client_id=client_id,
                sub_client_id=sub_client_id
            )
            results["summary"] = summary_result
            
            # 2. Action Items
            action_items_result = await generate_action_items(
                prompt=f"Extract and create detailed action items from this meeting, considering the client context: {full_context}",
                client_id=client_id,
                sub_client_id=sub_client_id
            )
            results["action_items"] = action_items_result
            
            # 3. Follow-up Email
            if attendees:
                email_result = await generate_email(
                    prompt=f"Create a professional follow-up email for meeting attendees summarizing key points and next steps: {full_context}",
                    client_id=client_id,
                    sub_client_id=sub_client_id,
                    recipient_name=attendees[0] if attendees else None
                )
                results["follow_up_email"] = email_result
            
            return results
            
        except Exception as e:
            logger.error(f"Error generating AI content: {e}")
            return {"error": str(e)}
    
    async def _store_meeting_results(
        self,
        meeting_data: Dict,
        transcript_text: str,
        video_url: Optional[str],
        audio_url: Optional[str],
        ai_results: Dict[str, Any]
    ):
        """Store all meeting results in database"""
        try:
            client_id = meeting_data["client_id"]
            sub_client_id = meeting_data.get("sub_client_id")
            user_id = meeting_data["user_id"]
            meeting_title = meeting_data["meeting_title"]
            
            # Store each AI-generated output
            for content_type, result in ai_results.items():
                if result and result.get("success"):
                    # Create proper title and prompt for each content type
                    titles = {
                        "summary": f"Meeting Summary - {meeting_title}",
                        "action_items": f"Action Items - {meeting_title}",
                        "follow_up_email": f"Follow-up Email - {meeting_title}"
                    }

                    prompts = {
                        "summary": f"Create a comprehensive meeting summary for: {meeting_title}",
                        "action_items": f"Extract action items from meeting: {meeting_title}",
                        "follow_up_email": f"Generate follow-up email for meeting: {meeting_title}"
                    }

                    output = Output(
                        title=titles.get(content_type, f"{content_type.title()} - {meeting_title}"),
                        content=result.get("content", ""),
                        output_type=content_type,
                        prompt=prompts.get(content_type, f"Generate {content_type} for meeting"),
                        client_id=client_id,
                        sub_client_id=sub_client_id,
                        user_id=user_id,
                        meeting_id=meeting_data["meeting_id"],
                        context_used=f"Meeting transcript and client knowledge base for {meeting_title}",
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    
                    # Try to store the output
                    try:
                        await db_manager.create_output(output)
                        logger.info(f"✅ Stored {content_type} output successfully")
                    except Exception as storage_error:
                        logger.error(f"❌ Failed to store {content_type}: {storage_error}")

                        # Try alternative storage method - direct database insert
                        try:
                            await self._store_output_direct(
                                content_type=content_type,
                                content=result.get("content", ""),
                                meeting_data=meeting_data,
                                user_id=user_id,
                                client_id=client_id,
                                sub_client_id=sub_client_id
                            )
                            logger.info(f"✅ Stored {content_type} using direct method")
                        except Exception as direct_error:
                            logger.error(f"❌ Direct storage also failed for {content_type}: {direct_error}")
            
            logger.info(f"✅ Stored {len(ai_results)} AI outputs for meeting {meeting_data['meeting_id']}")

        except Exception as e:
            logger.error(f"Error storing meeting results: {e}")

    async def _store_output_direct(
        self,
        content_type: str,
        content: str,
        meeting_data: Dict,
        user_id: str,
        client_id: str,
        sub_client_id: Optional[str]
    ):
        """Direct storage method that bypasses Pydantic validation"""
        try:
            import uuid

            # Create a simple dict for direct database insertion
            # Use proper UUIDs or None for invalid UUIDs
            def safe_uuid(value):
                if not value:
                    return None
                try:
                    # Try to parse as UUID
                    import uuid as uuid_module
                    uuid_module.UUID(value)
                    return value
                except (ValueError, TypeError):
                    # If not a valid UUID, return None
                    logger.warning(f"Invalid UUID format: {value}, using None")
                    return None

            output_data = {
                "id": str(uuid.uuid4()),
                "title": f"{content_type.title()} - {meeting_data.get('meeting_title', 'Meeting')}",
                "content": content,
                "output_type": content_type,
                "prompt": f"Generate {content_type} for meeting",
                "client_id": safe_uuid(client_id),
                "sub_client_id": safe_uuid(sub_client_id),
                "user_id": safe_uuid(user_id),
                "meeting_id": meeting_data.get("meeting_id"),
                "context_used": f"Meeting transcript and client knowledge base",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            # Direct database insertion
            from app.core.database import get_supabase_client
            client = get_supabase_client()

            result = client.table("outputs").insert(output_data).execute()

            if result.data:
                logger.info(f"✅ Direct storage successful for {content_type}")
                return True
            else:
                logger.error(f"❌ Direct storage failed for {content_type}: No data returned")
                return False

        except Exception as e:
            logger.error(f"❌ Direct storage error for {content_type}: {e}")
            return False
    
    def get_meeting_status(self, meeting_id: str) -> Optional[Dict]:
        """Get current status of a meeting"""
        return self.active_meetings.get(meeting_id)
    
    def list_active_meetings(self) -> List[Dict]:
        """List all active meetings"""
        return list(self.active_meetings.values())


# Global service instance
meeting_intelligence = MeetingIntelligenceService()
