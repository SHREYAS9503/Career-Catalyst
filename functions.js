import PDFDocument from 'pdfkit';
import fs from 'fs';

// Helper function to add section titles with a separator line
function addSectionTitle(doc, title, colors) {
  doc.fontSize(18)
     .fillColor(colors.primary)
     .text(title, { underline: true })
     .moveDown(0.5);
  doc.strokeColor(colors.secondary)
     .lineWidth(1)
     .moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.width - doc.page.margins.right, doc.y)
     .stroke()
     .moveDown(1);
}

// Helper function to add content with bullet points
function addBulletedList(doc, items, colors) {
  items.forEach((item) => {
    doc.fontSize(12)
       .fillColor(colors.darkGray)
       .text(`• ${item}`, { align: 'left' })
       .moveDown(0.5);
  });
  doc.moveDown(1);
}

// Helper function to add wrapped text
function addWrappedText(doc, text, options, colors) {
  doc.fontSize(12)
     .fillColor(colors.darkGray)
     .text(text, options)
     .moveDown(1);
}

function generateBeautifulResume(details, outputPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  // Pipe the PDF into a writable stream
  doc.pipe(fs.createWriteStream(outputPath));

  // Professional color palette
  const colors = {
    primary: '#2C3E50', // dark blue
    secondary: '#18BC9C', // teal
    accent: '#E74C3C', // red
    lightGray: '#ECF0F1',
    darkGray: '#7F8C8D'
  };

  // Function to add page borders
  function addPageBorders() {
    doc.lineWidth(2);
    doc.strokeColor(colors.primary);
    doc.rect(doc.page.margins.left - 20, doc.page.margins.top - 20, doc.page.width - doc.page.margins.left - doc.page.margins.right + 40, doc.page.height - doc.page.margins.top - doc.page.margins.bottom + 40).stroke();
  }

  // Event listener to add borders on each page addition
  doc.on('pageAdded', () => {
    addPageBorders();
  });

  // Function to add content for each section
  function addContent() {
    const {
      fullname,
      email,
      phone,
      github,
      linkedin,
      portfolio,
      address,
      summary,
      education,
      experience,
      hardSkills,
      softSkills,
      projects,
      certifications,
      awardsAchievements,
      nationality
    } = details;

    // Header Information
    doc.fontSize(28)
       .fillColor(colors.primary)
       .text(fullname, { align: 'center', underline: true })
       .moveDown(0.5);

    // Contact Information
    const contactInfo = [
      email,
      phone,
      ...(nationality ? [nationality] : []),
      ...(github ? [github] : []),
      ...(linkedin ? [linkedin] : []),
      ...(portfolio ? [portfolio] : [])
    ];

    // Split contact info into multiple lines if needed
    const contactInfoChunks = [];
    let currentLine = '';
    contactInfo.forEach(info => {
      if (currentLine.length + info.length + 2 > 80) { // Assuming 80 characters per line
        contactInfoChunks.push(currentLine.trim());
        currentLine = '';
      }
      currentLine += info + ' | ';
    });
    if (currentLine) contactInfoChunks.push(currentLine.trim());

    doc.fontSize(12)
       .fillColor(colors.darkGray)
       .text(contactInfoChunks.join('\n'), { align: 'center' })
       .moveDown(1);

    // Draw a line below personal information
    doc.strokeColor(colors.primary)
       .lineWidth(1)
       .moveTo(doc.page.margins.left, doc.y)
       .lineTo(doc.page.width - doc.page.margins.right, doc.y)
       .stroke()
       .moveDown(1);

    // Section: Summary
    addSectionTitle(doc, 'Summary', colors);
    addWrappedText(doc, summary, { align: 'justify', width: doc.page.width - 2 * doc.page.margins.left }, colors);

    // Section: Address
    if (address) {
      addSectionTitle(doc, 'Address', colors);
      addWrappedText(doc, address, { align: 'justify', width: doc.page.width - 2 * doc.page.margins.left }, colors);
    }

    // Section: Education
    addSectionTitle(doc, 'Education', colors);
    addBulletedList(doc, education, colors);

    // Section: Hard Skills
    if (hardSkills && hardSkills.length > 0) {
      addSectionTitle(doc, 'Hard Skills', colors);
      addBulletedList(doc, hardSkills, colors);
    }

    // Section: Soft Skills
    if (softSkills && softSkills.length > 0) {
      addSectionTitle(doc, 'Soft Skills', colors);
      addBulletedList(doc, softSkills, colors);
    }

    // Section: Projects
    if (projects && projects.length > 0) {
      addSectionTitle(doc, 'Projects', colors);
      addBulletedList(doc, projects, colors);
    }

    // Section: Experience
    if (experience) {
      addSectionTitle(doc, 'Experience', colors);
      addWrappedText(doc, experience, { align: 'justify', width: doc.page.width - 2 * doc.page.margins.left }, colors);
    }

    // Section: Certifications
    if (certifications && certifications.length > 0) {
      addSectionTitle(doc, 'Certifications', colors);
      addBulletedList(doc, certifications, colors);
    }

    // Section: Awards and Achievements
    if (awardsAchievements && awardsAchievements.length > 0) {
      addSectionTitle(doc, 'Awards and Achievements', colors);
      addBulletedList(doc, awardsAchievements, colors);
    }
  }

  // Add initial page border
  addPageBorders();

  // Add content to the PDF
  addContent();

  // Finalize the PDF and end the stream
  doc.end();
}

// Example usage with updated project
const resumeDetails = {
  fullname: "Your Name",
  email: "youremail@gmail.com",
  phone: "your_number",
  github: "https://github.com/your_github_profile",
  linkedin: "https://www.linkedin.com/in/your_linkedin_profile",
  portfolio: "https://your_website.com",
  address: "Your Address: location, City, State, Country",
  summary: "Your Summary: Briefly describe your professional background and career goals. Include your skills, experience, and certifications.",
  education: ["Your education details 1", "Your education details 2", "Your education details 3"],
  experience: "Your experience",
  hardSkills: ['Hard skill 1', 'Hard skill 2', 'Hard skill 3'],
  softSkills: ['Soft skill 1', 'Soft skill 2', 'Soft skill 3'],
  projects: ['Project 1', 'Project 2', 'Project 3'],
  certifications: ["Certification 1", "Certification 2", "Certification 3"],
  awardsAchievements: ["Award 1", "Award 2", "Award 3"],
  nationality: "Your nationality"
};

generateBeautifulResume(resumeDetails, './public/resume.pdf');

export { generateBeautifulResume };
