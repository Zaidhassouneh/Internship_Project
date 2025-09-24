import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header.component';
import { FooterComponent } from '../layout/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm = {
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitMessage = '';

  constructor() {}

  onSubmit() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    this.submitMessage = '';

    // Create mailto link with form data
    const emailBody = this.contactForm.message.trim();

    const mailtoLink = `mailto:Zaidhassouneh256@hotmail.com?subject=${encodeURIComponent(this.contactForm.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Reset form after a short delay
    setTimeout(() => {
      this.contactForm = {
        subject: '',
        message: ''
      };
      this.isSubmitting = false;
      this.submitMessage = 'Thank you! Your email client should open with the message ready to send.';
    }, 1000);
  }
}
